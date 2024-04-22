import "dotenv/config";
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { MyPipelineAppStage } from './test-repo-app-stage';

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        const gitHubRepo = "SDC-Team10-Sandbox/test-repo";

        const gitHubSecretPath = "BCBS/CloudBasedDevOps/dev/github-token";

        const gitHubToken = Secret.fromSecretNameV2(this, 'ImportedSecret', gitHubSecretPath).secretValue;

        const pipeline = new CodePipeline(this, 'test-repo-Pipeline', {
            pipelineName: 'test-repo',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub(gitHubRepo, "main", {authentication: gitHubToken}),
                commands: ['npm ci', 'npm run build', 'npx cdk synth'],
            })
        });
        
        const testingStage = pipeline.addStage(new MyPipelineAppStage(this, 'testing', {
            env: { account: "339713131596", region: "us-east-1" }
        }));
        
        testingStage.addPre(new ShellStep("Check for Unauthorized Configurations", {
            commands:[`[ -z "${process.env.UNAUTHORIZED_CONFIG}" ] && exit 0 || grep -r -q "${process.env.UNAUTHORIZED_CONFIG}" lib/ && exit 1 || exit 0`
            ]
        }))
        
        testingStage.addPost(new ShellStep("Run Tests", {
            commands: ['npm install', 'npm run test'],
        }));
        
        const deployStage = pipeline.addStage(new MyPipelineAppStage(this, 'deployment', {
            env: { account: "339713131596", region: "us-east-1" }
        }));
        
        deployStage.addPost(new ShellStep("Deployment", {
            commands: ['npm install', 'npm run test'],
        }));
        
    }
}