pipeline {
  agent any

  environment {
    DOCKER_REPOSITORY = 'registry.beamewa.com.vn/beam-uat/cms-frontend'
  }

  stages {
    stage('Build Image') {
      steps {
        nvm('v18.19.1') {
          sh 'npm install --force'
          sh 'npm run build'
          sh 'docker build -t $DOCKER_REPOSITORY .'
        }
      }
    }
    stage('Push Image') {
      steps {
        scripts {
          sh 'docker push $DOCKER_REPOSITORY'
          sh 'echo test'
        }
      }
    }
  }
}