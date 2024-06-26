import { Duration, Size, Stack, StackProps } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
  AwsLogDriverMode, Cluster, ContainerImage, LogDrivers, FargateService, FargateTaskDefinition, Protocol
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  certDomainName?: string;
  ecrRepository: Repository;
}

export class ApiStack extends Stack {

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
    });

    // Can use the default VPC instead:
    // const vpc = Vpc.fromLookup(this, 'Vpc', {
    //   isDefault: true,
    // });

    const cluster = new Cluster(this, 'Cluster', {
      vpc: vpc,
      capacity: {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
        desiredCapacity: 2,
        maxCapacity: 2,
      }
    });

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    taskDefinition.addContainer('DefaultContainer', {
      image: ContainerImage.fromEcrRepository(props.ecrRepository, 'latest'),
      memoryLimitMiB: 512,
      logging: LogDrivers.awsLogs({
        streamPrefix: 'TestStreamPrefix',
        mode: AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: Size.mebibytes(25),
      }),
      portMappings: [ { containerPort: 80, protocol: Protocol.TCP, } ],
      healthCheck: {
        command: [ "CMD-SHELL", "curl -f http://localhost/health || exit 1" ],
        interval: Duration.minutes(1),
        retries: 3,
        startPeriod: Duration.minutes(1),
        timeout: Duration.minutes(1),
      }
    });

    const fargateService = new FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      assignPublicIp: false,
      desiredCount: 2,
    });

    const alb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: vpc,
      internetFacing: true
    });

    const listener = alb.addListener('AlbListener', { port: 80 });
    listener.addTargets('target', {
      port: 80,
      targets: [ fargateService ],
      healthCheck: {
        path: '/health',
        interval: Duration.minutes(2),
        timeout: Duration.minutes(1),
      }
    });
  }
}
