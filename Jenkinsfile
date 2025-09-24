pipeline {
  agent any
  parameters {
    string(name:'REGISTRY', defaultValue:'your-org', description:'Docker registry/org')
    string(name:'TAG', defaultValue:'${BUILD_NUMBER}', description:'Image tag')
    booleanParam(name:'PUSH_IMAGES', defaultValue:true, description:'Push images to registry')
    booleanParam(name:'DEPLOY_EKS', defaultValue:false, description:'Deploy to EKS')
    string(name:'AWS_REGION', defaultValue:'ap-south-1')
    string(name:'EKS_CLUSTER', defaultValue:'<cluster-name>')
    string(name:'K8S_NAMESPACE', defaultValue:'microdemo')
    credentials(name:'DOCKERHUB_CREDS', defaultValue:'', description:'Docker creds (optional)')
  }
  environment { IMAGE_TAG = "${TAG}"; REGISTRY="${REGISTRY}" }
  stages {
    stage('Checkout'){ steps{ checkout scm } }
    stage('Install & Test'){
      parallel{
        stage('users'){steps{dir('services/users'){sh 'npm ci || npm install'; sh 'npm test'}}}
        stage('products'){steps{dir('services/products'){sh 'npm ci || npm install'; sh 'npm test'}}}
        stage('orders'){steps{dir('services/orders'){sh 'npm ci || npm install'; sh 'npm test'}}}
        stage('payments'){steps{dir('services/payments'){sh 'npm ci || npm install'; sh 'npm test'}}}
        stage('gateway'){steps{dir('services/api-gateway'){sh 'npm ci || npm install'; sh 'npm test'}}}
      }
    }
    stage('Build Images'){
      parallel{
        stage('users img'){steps{sh "docker build -t ${REGISTRY}/users:${IMAGE_TAG} services/users"}}
        stage('products img'){steps{sh "docker build -t ${REGISTRY}/products:${IMAGE_TAG} services/products"}}
        stage('orders img'){steps{sh "docker build -t ${REGISTRY}/orders:${IMAGE_TAG} services/orders"}}
        stage('payments img'){steps{sh "docker build -t ${REGISTRY}/payments:${IMAGE_TAG} services/payments"}}
        stage('gateway img'){steps{sh "docker build -t ${REGISTRY}/api-gateway:${IMAGE_TAG} services/api-gateway"}}
      }
    }
    stage('Push Images'){
      when{ expression{ return params.PUSH_IMAGES } }
      steps{
        script{ if (params.DOCKERHUB_CREDS){ withCredentials([usernamePassword(credentialsId: params.DOCKERHUB_CREDS, usernameVariable: 'U', passwordVariable: 'P')]){ sh 'echo "$P" | docker login -u "$U" --password-stdin' } } }
        parallel{
          stage('push users'){steps{sh "docker push ${REGISTRY}/users:${IMAGE_TAG}"}}
          stage('push products'){steps{sh "docker push ${REGISTRY}/products:${IMAGE_TAG}"}}
          stage('push orders'){steps{sh "docker push ${REGISTRY}/orders:${IMAGE_TAG}"}}
          stage('push payments'){steps{sh "docker push ${REGISTRY}/payments:${IMAGE_TAG}"}}
          stage('push gateway'){steps{sh "docker push ${REGISTRY}/api-gateway:${IMAGE_TAG}"}}
        }
      }
    }
    stage('Deploy EKS'){
      when{ expression{ return params.DEPLOY_EKS } }
      steps{
        sh '''
          set -e
          aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER
          kubectl get ns $K8S_NAMESPACE >/dev/null 2>&1 || kubectl create ns $K8S_NAMESPACE
          for d in users products orders payments api-gateway; do
            kubectl -n $K8S_NAMESPACE apply -f services/$d/k8s/
            kubectl -n $K8S_NAMESPACE set image deploy/$d $d=$REGISTRY/$d:$IMAGE_TAG --record=true || true
          done
          kubectl -n $K8S_NAMESPACE rollout status deploy/api-gateway --timeout=120s || true
        '''
      }
    }
  }
}
