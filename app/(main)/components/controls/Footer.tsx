export default function Footer() {
  return (
    <footer className="footer-bar">
      <div className="footer-content">
        <a 
          href="https://open-meteo.com/" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Dados meteorológicos por Open-Meteo.com
        </a>
        <span>
          Versão: {process.env.APP_VERSION}
        </span>
      </div>
    </footer>
  );
}