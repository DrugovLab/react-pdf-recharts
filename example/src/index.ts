import ReactPDF from '@react-pdf/renderer';
import ExampleDocument from './ExampleDocument';

async function createPDF() {
    await ReactPDF.render(ExampleDocument(), `example.pdf`);
}

createPDF();