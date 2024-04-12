build-dev-client:
	echo \# make build-dev-cms="$(tag)"
	docker build --platform linux/amd64 --tag cms-frontend:$(tag) .
	docker tag cms-frontend:$(tag) registry.beamewa.com.vn/beam-uat/cms-frontend
	docker login registry.beamewa.com.vn -u hieult3105 -p C9231fc1c61124
	docker push registry.beamewa.com.vn/beam-uat/cms-frontend
	ssh -i ~/.ssh/flexpay-be ubuntu@42.113.122.123 docker pull registry.beamewa.com.vn/beam-uat/cms-frontend
	ssh -i ~/.ssh/flexpay-be ubuntu@42.113.122.123 docker rm -f frontend-cms 2> /dev/null
  ssh -i ~/.ssh/flexpay-be ubuntu@42.113.122.123 docker run -dit -p 8000:8000 --name=frontend-cms registry.beamewa.com.vn/beam-uat/cms-frontend
