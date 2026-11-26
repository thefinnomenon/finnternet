// Configure a new deployment with your own public Amplify settings.
// Public pool/client identifiers are not server credentials. Never add secret keys here.
const region = process.env.NEXT_PUBLIC_AWS_REGION;
const config = {
  aws_project_region: region,
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
  aws_appsync_region: region,
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: region,
  aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  oauth: {},
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: { passwordPolicyMinLength: 8, passwordPolicyCharacters: [] },
  aws_cognito_verification_mechanisms: ['EMAIL'],
  aws_user_files_s3_bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
  aws_user_files_s3_bucket_region: region,
};
export default config;
