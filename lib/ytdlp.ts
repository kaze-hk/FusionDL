import { exec } from 'child_process';
import { promisify } from 'util';
import { getYtDlpPath as getConfigYtDlpPath } from './config';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);

export async function executeYtDlp(args: string): Promise<string> {
  const ytDlpPath = getConfigYtDlpPath();
  const command = `"${ytDlpPath}" ${args}`;
  
  const { stdout } = await execAsync(command, {
    env: {
      ...process.env,
      PATH: `${process.env.PATH}:${path.join(os.homedir(), '.local', 'bin')}`,
    },
  });
  
  return stdout;
}
