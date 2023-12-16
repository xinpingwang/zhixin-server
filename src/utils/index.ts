import fs from 'fs'

export function findChromeExecutablePath() {
  // if platform is macOS, find inf /Applications or $HOME/Applications
  if (process.platform === 'darwin') {
    const paths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    ]
    for (const path of paths) {
      if (fs.existsSync(path)) {
        return path
      }
    }
  }
  // if platform is linux, find in /usr/bin
  else if (process.platform === 'linux') {
    if (fs.existsSync('/usr/bin/google-chrome')) {
      return '/usr/bin/google-chrome'
    }
  }
}
