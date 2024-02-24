pipeline {
  agent any
    environment {
      DOCKER_REPOSITORY = 'registry.beamewa.com.vn/beam-uat/cms-frontend'
      WORKER_HOST = '10.10.10.2'
      WORKER_USER = 'ubuntu'
      TELEGRAM_MONITORING_CHANNEL_ID = -1002076184692
    }

  stages {
    stage('Build Image') {
      steps {
          sh 'echo TEST'
      }
    }
  }

  post {
    success {
      telegramSend(message: 'Test Message', chatId: -1002076184692)
    }
  }
}