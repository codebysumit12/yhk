// Quick test to see what ports are available
import net from 'net';

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      console.log(`Port ${port} is available`);
      server.close(() => resolve(true));
    });
    
    server.on('error', () => {
      console.log(`Port ${port} is in use`);
      resolve(false);
    });
  });
}

async function checkPorts() {
  console.log('Checking port availability...');
  
  const ports = [5000, 5001, 5002, 5003, 5004, 5005];
  
  for (const port of ports) {
    await checkPort(port);
  }
}

checkPorts();
