# Example Analyzer/UI Setup

First checkout the repository at [https://github.com/MaibornWolff/microservice-visualization]().

## Run the Customized Analyzer

1. Change directory to customized-analyzer-example.
2. Create `.env` file in current directory and add content below. Substitute `<cwd>` with the absolute path to the current directory.
```
SOURCE_FOLDER=<cwd>/dummy-system-source
PORT=8081
```
3. Run `yarn install`
4. Run `yarn start`
5. Access JSON representation of analyzed dummy system: [http://localhost:8081/collect/system]()

## Run the UI

1. Open another shell and change to the tadis-ui directory
2. Create `.env` file in the tadis-ui directory and add content below.
```
PORT=8080
CACHE_TTL_SECONDS=10
SYSTEM_PROVIDER_URL=http://localhost:8081/collect/system?version=1
```
3. Run `yarn install`
4. Run `yarn start`
5. Open base path to UI in browser: [http://localhost:8080]()
6. Navigate to actual UI: [http://localhost:8080/tadis/html/]()