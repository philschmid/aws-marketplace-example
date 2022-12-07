#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MarketplaceStack, MarketplaceStackProps } from '../lib/marketplaceStack';

const props: MarketplaceStackProps = {
  name: 'marketplace-test',
  marketplaceSnsTopic: 'arn:aws:sns:us-east-1:123456789012:MarketplaceTopic'
}


const app = new cdk.App();
new MarketplaceStack(app, 'MarketplaceStack', {
  ...props,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});