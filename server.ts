import app from './src/app'
import { config } from './src/config/config'


function startServer() {
    const port = config.port || 3000;
    
    app.listen(port, () => {
        console.log('server is up on port '+ port);
        
    })
}

startServer();