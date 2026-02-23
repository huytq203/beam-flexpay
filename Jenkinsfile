pipeline {
  agent any
    environment {
      DOCKER_REPOSITORY = 'registry.beamewa.com.vn/beam-uat/cms-frontend'
      WORKER_HOST = '10.10.10.2'
      WORKER_USER = 'ubuntu'
      TELEGRAM_MONITORING_CHANNEL_ID = '-1002076184692'
    }

  stages {
    stage('Build Image') {
      steps {
        sh 'npm install'
          sh '''docker build -f Dockerfile.uat \
            --build-arg VITE_API_LOGIN=https://api.dev.ewallet.flexpay.vn/identity/api/v1/admin \
            --build-arg VITE_API_WALLETCORE=https://api.dev.ewallet.flexpay.vn/wallet-core/api/v1/admin \
            --build-arg VITE_FEE_API_URL=https://api.dev.ewallet.flexpay.vn/fee/api/v1/admin \
            --build-arg VITE_API_MERCHANT=https://api.dev.ewallet.flexpay.vn/merchant/api/v1/admin \
            --build-arg VITE_API_URL=https://cms.ewallet.devops.beamewa.com.vn/api/admin \
            --build-arg DEPLOY_VERSION=$(date +%s) \
            -t $DOCKER_REPOSITORY .'''
      }
    }
    stage('Push Image') {
      steps {
        sh 'docker push $DOCKER_REPOSITORY'
      }
    }
    stage('Pull Image & Rebuild') {
      steps {
        sshagent(credentials : ['worker-node']) {
          sh 'ssh -o StrictHostKeyChecking=no -l $WORKER_USER $WORKER_HOST docker pull $DOCKER_REPOSITORY'
          sh 'ssh -o StrictHostKeyChecking=no -l $WORKER_USER $WORKER_HOST docker rm -f frontend-cms 2> /dev/null'
          sh 'ssh -o StrictHostKeyChecking=no -l $WORKER_USER $WORKER_HOST docker run -dit -p 8000:8000 --name=frontend-cms $DOCKER_REPOSITORY'
        } 
      }

    }
  }

}