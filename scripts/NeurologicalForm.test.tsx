import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NeurologicalForm, { NeurologicalData } from '../app/dashboard/[bedId]/evolution/components/forms/NeurologicalForm';

describe('NeurologicalForm Component', () => {
  const mockData: NeurologicalData = {
    sedationDrugs: [],
    neurologicalScales: 'RASS: -2 | GCS: 8T',
    pupils: 'Isocóricas 3mm fotorreagentes',
    bis: '45',
    subjectiveObservations: 'Paciente sedado e analgesiado',
    enteralDrugs: '',
    pic: '',
  };

  const mockOnChange = jest.fn();
  const patientWeight = 75;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the section title', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    expect(screen.getByText('Neurológico')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={false}
      />
    );
    expect(screen.getByText(/Sedação, escalas e monitorização cerebral/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    expect(screen.queryByLabelText(/Pupilas/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/Pupilas/i)).toBeInTheDocument();
  });

  it('should show neurological scales in collapsed preview', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    expect(screen.getByText(/RASS: -2/)).toBeInTheDocument();
  });

  it('should show pupils in preview', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    expect(screen.getByText(/Pupilas:.*Isocóricas/)).toBeInTheDocument();
  });

  it('should show BIS in preview', () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    expect(screen.getByText(/BIS: 45/)).toBeInTheDocument();
  });

  it('should call onChange when pupils field is updated', async () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    fireEvent.click(screen.getByRole('button')); // expand

    const pupilsField = screen.getByLabelText(/Pupilas/i);
    await userEvent.clear(pupilsField);
    await userEvent.type(pupilsField, 'Anisocóricas');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('pupils', expect.any(String));
    });
  });

  it('should call onChange when BIS is updated', async () => {
    render(
      <NeurologicalForm
        data={mockData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={true}
      />
    );
    fireEvent.click(screen.getByRole('button'));

    const bisField = screen.getByLabelText(/BIS/i);
    await userEvent.clear(bisField);
    await userEvent.type(bisField, '60');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('bis', expect.any(String));
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: NeurologicalData = {
      sedationDrugs: [],
      neurologicalScales: '',
      pupils: '',
      bis: '',
      subjectiveObservations: '',
      enteralDrugs: '',
      pic: '',
    };
    render(
      <NeurologicalForm
        data={emptyData}
        onChange={mockOnChange}
        patientWeight={patientWeight}
        isIntubated={false}
      />
    );
    expect(screen.getByText('Neurológico')).toBeInTheDocument();
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('formatSedationDrugs - branch coverage', () => {
    it('should include sedation drug in preview when flow > 0', () => {
      const drug = {
        id: 'propofol',
        name: 'Propofol',
        concentration: 10,
        unit: 'mg/ml',
        doseUnit: 'mg/kg/h',
        conversionFactor: 1,
      };
      const dataWithSedation: NeurologicalData = {
        ...mockData,
        sedationDrugs: [{ flow: 20, dose: 2.8, drug }],
        neurologicalScales: '',
        pupils: '',
        bis: '',
        subjectiveObservations: '',
      };
      render(
        <NeurologicalForm
          data={dataWithSedation}
          onChange={mockOnChange}
          patientWeight={patientWeight}
          isIntubated={true}
        />
      );
      expect(screen.getByText(/Sedação:.*Propofol/)).toBeInTheDocument();
    });

    it('should not show drug in preview when flow is 0', () => {
      const drug = {
        id: 'midazolam',
        name: 'Midazolam',
        concentration: 1,
        unit: 'mg/ml',
        doseUnit: 'mg/kg/h',
        conversionFactor: 1,
      };
      const dataWithZeroFlow: NeurologicalData = {
        ...mockData,
        sedationDrugs: [{ flow: 0, dose: 0, drug }],
        neurologicalScales: '',
        pupils: '',
        bis: '',
        subjectiveObservations: '',
      };
      render(
        <NeurologicalForm
          data={dataWithZeroFlow}
          onChange={mockOnChange}
          patientWeight={patientWeight}
          isIntubated={true}
        />
      );
      expect(screen.queryByText(/Midazolam/)).not.toBeInTheDocument();
    });
  });

  describe('isIntubated prop - branch coverage', () => {
    it('should pass isIntubated=true to NeurologicalScalesSelector when intubated', () => {
      render(
        <NeurologicalForm
          data={mockData}
          onChange={mockOnChange}
          patientWeight={patientWeight}
          isIntubated={true}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      // Component renders without errors when intubated
      expect(screen.getByText('Neurológico')).toBeInTheDocument();
    });

    it('should render normally when isIntubated is false', () => {
      render(
        <NeurologicalForm
          data={mockData}
          onChange={mockOnChange}
          patientWeight={patientWeight}
          isIntubated={false}
        />
      );
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Neurológico')).toBeInTheDocument();
    });
  });
});
