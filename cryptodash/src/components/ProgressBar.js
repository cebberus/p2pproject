import './ProgressBar.css';
const ProgressBar = ({ step }) => {
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;
  const strokeDashoffset = 282.743 - (progress * 282.743) / 100;

  return (
    <div className="progress-bar-container">
      <svg className="CircularProgressbar" viewBox="0 0 100 100">
        <path className="CircularProgressbar-trail" d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90" strokeWidth="10" fillOpacity="0"></path>
        <path className="CircularProgressbar-path" d="M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90" strokeWidth="10" fillOpacity="0" style={{ strokeDasharray: '282.743px, 282.743px', strokeDashoffset: `${strokeDashoffset}px` }}></path>
      </svg>
      <div className="progress-text">{step} de {totalSteps}</div>
    </div>
  );
};

export default ProgressBar;

  