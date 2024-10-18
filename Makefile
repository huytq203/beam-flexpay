build-dev-client:
	echo \# make build-dev-cms="$(tag)"
	docker build --platform linux/amd64 --tag cms-frontend:$(tag) . && docker tag cms-frontend:$(tag) registry.beamewa.com.vn/beam-uat/cms-frontend:$(tag)
	docker login registry.beamewa.com.vn -u hieult3105 -p C9231fc1c61124
  docker push registry.beamewa.com.vn/beam-uat/cms-frontend:$(tag)
