#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { EcrStack } from '../cdk/lib/stacks/ecr-stack';
import { ApiStack } from '../cdk/lib/stacks/api-stack';

const app = new App();

const ecrStack = new EcrStack(app, 'EcrStack', {});

new ApiStack(app, 'ApiStack', {
  ecrRepository: ecrStack.ecrRepository
});
