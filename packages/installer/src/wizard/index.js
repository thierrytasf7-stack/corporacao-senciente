import React, { useState } from 'react';
import { Steps, Button, message } from 'antd';
import WelcomeStep from './steps/WelcomeStep';
import ConfigStep from './steps/ConfigStep';
import ValidationStep from './steps/ValidationStep';
import CompletionStep from './steps/CompletionStep';

const { Step } = Steps;

function InstallerWizard() {
  const [current, setCurrent] = useState(0);
  const [config, setConfig] = useState({
    username: '',
    theme: 'light',
    shortcuts: {}
  });

  const steps = [
    {
      title: 'Bem-vindo',
      content: <WelcomeStep onNext={() => setCurrent(1)} />,
    },
    {
      title: 'Configurações',
      content: <ConfigStep 
        config={config} 
        onConfigChange={setConfig} 
        onNext={() => setCurrent(2)} 
        onBack={() => setCurrent(0)} 
      />,
    },
    {
      title: 'Validação',
      content: <ValidationStep onNext={() => setCurrent(3)} onBack={() => setCurrent(1)} />,
    },
    {
      title: 'Conclusão',
      content: <CompletionStep onFinish={() => message.success('Instalação concluída!')} onBack={() => setCurrent(2)} />,
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 40 }}>
      <Steps current={current} style={{ marginBottom: 30 }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <div className="step-content">{steps[current].content}</div>
      <div className="step-actions">
        {current > 0 && (
          <Button style={{ marginRight: 8 }} onClick={prev}>
            Anterior
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Próximo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => steps[current].content.props.onFinish()}>
            Concluir
          </Button>
        )}
      </div>
    </div>
  );
}

export default InstallerWizard;
