import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HemodynamicsForm, { HemodynamicsData } from '../app/dashboard/[bedId]/evolution/components/forms/HemodynamicsForm';

describe('HemodynamicsForm Component', () => {
  const mockData: HemodynamicsData = {
    vasoactiveDrugs: [],
    pam: '75',
    fc: '72',
    rhythm: 'Sinusal',
    enteralDrugs: '',
    tec: '2s',
    lactate: '1.2',
    svco2: '70',
    gapco2: '4',
    observations: 'Hemodinamicamente estável',
  };

  const mockOnChange = jest.fn();
  const patientWeight = 70;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the section title', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText('Hemodinâmica')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText(/Perfusão, ritmo e drogas vasoativas/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.queryByLabelText(/PAM/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/PAM/i)).toBeInTheDocument();
  });

  it('should show preview with vital signs when collapsed', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText(/PAM: 75 mmHg/)).toBeInTheDocument();
    expect(screen.getByText(/FC: 72 bpm/)).toBeInTheDocument();
  });

  it('should show lactate and SvcO2 in preview when present', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText(/Lactato: 1\.2/)).toBeInTheDocument();
    expect(screen.getByText(/SvcO2: 70%/)).toBeInTheDocument();
  });

  it('should show observations in preview', () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText(/Hemodinamicamente estável/)).toBeInTheDocument();
  });

  it('should call onChange when PAM value is updated', async () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const pamField = screen.getByLabelText(/PAM/i);
    await userEvent.clear(pamField);
    await userEvent.type(pamField, '65');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('pam', expect.any(String));
    });
  });

  it('should call onChange when FC is updated', async () => {
    render(<HemodynamicsForm data={mockData} onChange={mockOnChange} patientWeight={patientWeight} />);
    fireEvent.click(screen.getByRole('button'));

    const fcField = screen.getByLabelText(/FC/i);
    await userEvent.clear(fcField);
    await userEvent.type(fcField, '90');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('fc', expect.any(String));
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: HemodynamicsData = {
      vasoactiveDrugs: [],
      pam: '',
      fc: '',
      rhythm: '',
      enteralDrugs: '',
      tec: '',
      lactate: '',
      svco2: '',
      gapco2: '',
      observations: '',
    };
    render(<HemodynamicsForm data={emptyData} onChange={mockOnChange} patientWeight={patientWeight} />);
    expect(screen.getByText('Hemodinâmica')).toBeInTheDocument();
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('formatVasoactiveDrugs - branch coverage', () => {
    it('should format drug in preview when vasoactive drug is present with flow > 0', () => {
      const drug = {
        id: 'noradrenalina_simples',
        name: 'Noradrenalina simples',
        concentration: 64,
        unit: 'mcg/ml',
        doseUnit: 'mcg/kg/min',
        conversionFactor: 60,
      };
      const dataWithDrug: HemodynamicsData = {
        ...mockData,
        vasoactiveDrugs: [{ flow: 5, dose: 0.1, patientWeight, drug }],
      };
      render(<HemodynamicsForm data={dataWithDrug} onChange={mockOnChange} patientWeight={patientWeight} />);
      expect(screen.getByText(/Drogas Vasoativas:.*Noradrenalina/)).toBeInTheDocument();
    });

    it('should not show drug in preview when flow is 0', () => {
      const drug = {
        id: 'dobutamina',
        name: 'Dobutamina',
        concentration: 1000,
        unit: 'mcg/ml',
        doseUnit: 'mcg/kg/min',
        conversionFactor: 60,
      };
      const dataWithZeroFlow: HemodynamicsData = {
        ...mockData,
        vasoactiveDrugs: [{ flow: 0, dose: 0, patientWeight, drug }],
        pam: '',
        fc: '',
        rhythm: '',
        tec: '',
        lactate: '',
        svco2: '',
        gapco2: '',
        observations: '',
      };
      render(<HemodynamicsForm data={dataWithZeroFlow} onChange={mockOnChange} patientWeight={patientWeight} />);
      expect(screen.queryByText(/Dobutamina/)).not.toBeInTheDocument();
    });
  });
});
