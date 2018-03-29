const config = {
  'TEST': {
    'HOST': 'http://localhost',
    'PORT': '4004'
  }
}

const MODE = 'TEST';
const selectedConfig = config[MODE];

export default selectedConfig;