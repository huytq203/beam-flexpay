pipeline {
  agent any

  environment {
    DOCKER_REPOSITORY = 'registry.beamewa.com.vn/beam-uat/cms-frontend'
  }

  stages {
    stage('Build Image') {
      steps {
        script {
          source ~/.bashrc
          npm install
          npm run build
          docker build -t $DOCKER_REPOSITORY .
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