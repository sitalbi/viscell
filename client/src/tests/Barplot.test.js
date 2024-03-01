import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Barplot from '../components/Barplot';

test('clicking on a bar opens the correct hyperlink', () => {
  const width = 300;
  const height = 200;
  const cellName = "TestCell";
  const genes = new Map([
    ["ACTA2", 1],
    ["ACTC1", 1],
    ["ACTG2", 1]
  ]);
  const { getByTestId } = render(<Barplot width={width} height={height} cellName={cellName} genes={genes} />);
  const barElement = getByTestId('bar-ACTA2');
  const originalOpen = window.open;
  window.open = jest.fn();

  fireEvent.click(barElement);

  expect(window.open).toHaveBeenCalledWith('https://pubchem.ncbi.nlm.nih.gov/gene/ACTA2/Homo_sapiens');

  window.open = originalOpen;
});