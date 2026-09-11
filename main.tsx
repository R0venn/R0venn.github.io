import {createRoot} from 'react-dom/client';
import LocalNotebook from './app/local-notebook';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(<LocalNotebook/>);
