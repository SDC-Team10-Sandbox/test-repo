import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MyResourceStack } from './test-repo-resource-stack';

export class MyPipelineAppStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);
        
        const resourceStack = new MyResourceStack(this, 'test-repo-ResourceStack');
    }    
}