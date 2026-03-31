import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RespiratoryForm, { RespiratoryData } from '../app/dashboard/[bedId]/evolution/components/forms/RespiratoryForm';

describe('RespiratoryForm Component', () => {
  const mockDataFisiologica: RespiratoryData = {
    airwayType: 'fisiologica',
    supports: [],
    spo2: '98',
    sao2: '97',
    observations: 'Sem desconforto respiratório',
    chestXray: 'Hipertransparência bilateral',
  };

  const mockDataTOT: RespiratoryData = {
    airwayType: 'tot',
    supports: [
      {
        support: {
          id: 'vccontrolado',
          name: 'VC controlado',
          parameterType: 'vm_params',
          unit: '',
        },
        vmParameters: { fio2: '60', peep: '10', ps: '', pc: '', vc: '450', fr_real: '14' },
        value: '',
      },
    ],
    spo2: '95',
    sao2: '94',
    observations: 'VM protetora',
    chestXray: 'Infiltrado bilateral',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the section title', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.getByText('Sistema Respiratório')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.getByText(/Parâmetros ventilatórios e observações clínicas/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.queryByLabelText(/SpO2/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/SpO2/i)).toBeInTheDocument();
  });

  it('should collapse again when button is clicked twice', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn); // expand
    fireEvent.click(btn); // collapse
    expect(screen.queryByLabelText(/SpO2/i)).not.toBeInTheDocument();
  });

  it('should show SpO2 in preview when present', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.getByText(/SpO2: 98%/)).toBeInTheDocument();
  });

  it('should show SaO2 in preview when present', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.getByText(/SaO2: 97%/)).toBeInTheDocument();
  });

  it('should show observations in preview', () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    expect(screen.getByText(/Sem desconforto respiratório/)).toBeInTheDocument();
  });

  it('should call onChange when SpO2 is updated', async () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const spo2Field = screen.getByLabelText(/SpO2/i);
    await userEvent.clear(spo2Field);
    await userEvent.type(spo2Field, '96');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('spo2', expect.any(String));
    });
  });

  it('should call onChange when observations are updated', async () => {
    render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));

    const obsField = screen.getByLabelText(/Observações/i);
    await userEvent.clear(obsField);
    await userEvent.type(obsField, 'Desmame em progresso');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('observations', expect.any(String));
    });
  });

  // ── Branch Coverage: airwayType ────────────────────────────────────────────
  describe('airwayType - branch coverage', () => {
    it('should show "TOT" label in preview when airwayType is tot', () => {
      render(<RespiratoryForm data={mockDataTOT} onChange={mockOnChange} />);
      expect(screen.getByText(/TOT/)).toBeInTheDocument();
    });

    it('should show ventilator parameters in preview for TOT', () => {
      render(<RespiratoryForm data={mockDataTOT} onChange={mockOnChange} />);
      expect(screen.getByText(/FiO2 60%/)).toBeInTheDocument();
      expect(screen.getByText(/PEEP 10/)).toBeInTheDocument();
    });

    it('should show "TQT" in preview when airwayType is tqt', () => {
      const tqtData: RespiratoryData = { ...mockDataTOT, airwayType: 'tqt' };
      render(<RespiratoryForm data={tqtData} onChange={mockOnChange} />);
      expect(screen.getByText(/TQT/)).toBeInTheDocument();
    });

    it('should show "Ar ambiente" when fisiologica and no supports', () => {
      render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
      expect(screen.getByText(/Ar ambiente/)).toBeInTheDocument();
    });

    it('should call onChange with supports cleared when switching to fisiologica', () => {
      render(<RespiratoryForm data={mockDataTOT} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button')); // expand

      const fisiologicaRadio = screen.getByRole('radio', { name: /Via Aérea Fisiológica/i });
      fireEvent.click(fisiologicaRadio);

      expect(mockOnChange).toHaveBeenCalledWith('supports', []);
      expect(mockOnChange).toHaveBeenCalledWith('airwayType', 'fisiologica');
    });

    it('should call onChange with correct airwayType when TOT is selected', () => {
      render(<RespiratoryForm data={mockDataFisiologica} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button')); // expand

      const totRadio = screen.getByRole('radio', { name: /TOT \(Tubo Orotraqueal\)/i });
      fireEvent.click(totRadio);

      expect(mockOnChange).toHaveBeenCalledWith('airwayType', 'tot');
    });
  });

  describe('formatSupports - branch coverage', () => {
    it('should show simple O2 support with value in preview', () => {
      const o2Data: RespiratoryData = {
        airwayType: 'fisiologica',
        supports: [
          {
            support: { id: 'cateter', name: 'Cateter Nasal', parameterType: 'simple', unit: 'L/min' },
            value: '2',
            vmParameters: undefined,
          },
        ],
        spo2: '96',
        sao2: '',
        observations: '',
        chestXray: '',
      };
      render(<RespiratoryForm data={o2Data} onChange={mockOnChange} />);
      expect(screen.getByText(/Cateter Nasal.*2.*L\/min/)).toBeInTheDocument();
    });
  });

  it('should handle empty data safely', () => {
    const emptyData: RespiratoryData = {
      airwayType: 'fisiologica',
      supports: [],
      spo2: '',
      sao2: '',
      observations: '',
      chestXray: '',
    };
    render(<RespiratoryForm data={emptyData} onChange={mockOnChange} />);
    expect(screen.getByText('Sistema Respiratório')).toBeInTheDocument();
  });
});
