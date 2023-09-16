import {spawnSync} from 'child_process';
import process from 'process';

const localRoot = process.cwd();

const result = spawnSync(
  `docker run --rm -v ${localRoot}:/canvas-styled-text -v /canvas-styled-text/node_modules -w /canvas-styled-text --ipc=host canvas-styled-text ./scripts/test-docker.sh`,
  {
    stdio: 'inherit',
    shell: true,
  },
);

if (result.status < 0) {
  process.exit(result.status);
}
