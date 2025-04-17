// src/FormComponent.tsx
import { Input, Label, Button } from '@fluentui/react-components';
import './FormComponents.css';

const FormComponent = () => {
  return (
    <div className="form-wrapper">
      <form className="form">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Введите имя" />

        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Введите email" />

        <Button appearance="primary" type="submit">
          Send
        </Button>
      </form>
    </div>
  );
};

export default FormComponent;
