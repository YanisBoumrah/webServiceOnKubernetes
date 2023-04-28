pipeline {
    agent any

    stages {
        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Récupérer les informations d'authentification DockerHub à partir de Jenkins Credentials
                    def dockerHubUsername = 'yanisboumrah'
                    def dockerHubPassword = 'Zebbi25+*'

                    // Définir les variables d'environnement pour Docker
                    env.DOCKER_REGISTRY = 'docker'
                    env.DOCKER_IMAGE_NAME = 'webservicedevops'
                    env.DOCKER_IMAGE_TAG = 'latest'

                    // Construire l'image Docker à partir du Dockerfile et l'étiqueter avec le numéro de version de build
                    sh "docker build -t yanisboumrah/${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} ."

                    // Connecter Docker au registre DockerHub
                    sh "docker login -u ${dockerHubUsername} -p ${dockerHubPassword}"

                    // Pousser l'image Docker construite sur DockerHub
                    sh "docker push yanisboumrah/${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Charger le fichier de déploiement
                    def deploymentContent = readFile('deployment.yaml')

                    withCredentials([file(credentialsId: 'kubeconfig', variable: 'kubeconfigFile')]) {
                        // Créer un fichier temporaire pour stocker le kubeconfig
                        def kubeconfigTempFile = sh(script: 'mktemp', returnStdout: true).trim()
                        // Créer un fichier temporaire pour stocker le contenu du déploiement
                        def deploymentTempFile = sh(script: 'mktemp', returnStdout: true).trim()

                        // Copier le kubeconfig dans le fichier temporaire
                        sh "cp ${kubeconfigFile} ${kubeconfigTempFile}"
                        // Écrire le contenu du déploiement dans le fichier temporaire
                        writeFile(file: deploymentTempFile, text: deploymentContent)

                        try {
                            // Appliquer le fichier de déploiement au cluster Kubernetes
                            sh "KUBECONFIG=${kubeconfigTempFile} kubectl apply -f ${deploymentTempFile}"
                        } finally {
                            // Supprimer les fichiers temporaires
                            sh "rm -f ${kubeconfigTempFile} ${deploymentTempFile}"
                        }
                    }
                }
            }
        }
    }
}
