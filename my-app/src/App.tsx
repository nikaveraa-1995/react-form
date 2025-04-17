import FormComponent from './assets/FormComponents/FormComponents'; // путь может отличаться
import { FocusableElementsInCells as Example } from './assets/DataGrid/DataGrid';
import { CalendarSixWeeks } from './assets/Calendar/Calendar';

const App = () => {
  return (
    <div>
      <FormComponent />
      <Example />
      <CalendarSixWeeks />
    </div>
  );
};

export default App;
