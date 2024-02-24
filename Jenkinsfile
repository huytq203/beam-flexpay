pipeline {
  agent any
    environment {
      DOCKER_REPOSITORY = 'registry.beamewa.com.vn/beam-uat/cms-frontend'
      WORKER_HOST = '10.10.10.2'
      WORKER_USER = 'ubuntu'
    }

  stages {
    stage('Build Image') {
      steps {
        sh 'npm install'
          sh 'docker build -t $DOCKER_REPOSITORY .'
      }
    }
    stage('Push Image') {
      steps {
        sh 'docker push $DOCKER_REPOSITORY'
          sh 'echo test'
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