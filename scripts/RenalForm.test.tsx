import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RenalForm, { RenalData } from '../app/dashboard/[bedId]/evolution/components/forms/RenalForm';

describe('RenalForm Component', () => {
  const mockData: RenalData = {
    diuresis: '1800 ml/24h',
    diuretics: 'Furosemida 40 mg IV',
    glycemia: 'Glicemias na meta (120-180)',
    balance: 'Positivo +500 ml/24h',
    dialysis: 'Sem TRS',
    insulin: 'Insulina Regular em bomba',
    observations: 'Função renal preservada',
    corticoidUse: false,
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the section title', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Renal/Metabólico')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Diurese, função renal e controle glicêmico/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.queryByLabelText(/Diurese/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/Diurese/i)).toBeInTheDocument();
  });

  it('should collapse again when button is clicked twice', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn); // expand
    fireEvent.click(btn); // collapse
    expect(screen.queryByLabelText(/Diurese/i)).not.toBeInTheDocument();
  });

  it('should show diuresis in collapsed preview', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Diurese:.*1800 ml\/24h/)).toBeInTheDocument();
  });

  it('should show balance in collapsed preview', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/BH:.*Positivo \+500 ml\/24h/)).toBeInTheDocument();
  });

  it('should show dialysis info in preview', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/TRS:.*Sem TRS/)).toBeInTheDocument();
  });

  it('should show glycemia in preview', () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Glicemia:.*Glicemias na meta/)).toBeInTheDocument();
  });

  it('should call onChange when diuresis field is updated', async () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const diuresisField = screen.getByLabelText(/Diurese/i);
    await userEvent.clear(diuresisField);
    await userEvent.type(diuresisField, 'Oligúria 400 ml/24h');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('diuresis', expect.any(String));
    });
  });

  it('should call onChange when balance field is updated', async () => {
    render(<RenalForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));

    const balanceField = screen.getByLabelText(/Balanço Hídrico/i);
    await userEvent.clear(balanceField);
    await userEvent.type(balanceField, 'Negativo -200 ml/24h');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('balance', expect.any(String));
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: RenalData = {
      diuresis: '',
      diuretics: '',
      glycemia: '',
      balance: '',
      dialysis: '',
      insulin: '',
      observations: '',
      corticoidUse: false,
    };
    render(<RenalForm data={emptyData} onChange={mockOnChange} />);
    expect(screen.getByText('Renal/Metabólico')).toBeInTheDocument();
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('generatePreview - branch coverage', () => {
    it('should include diuretics in preview when set', () => {
      render(<RenalForm data={mockData} onChange={mockOnChange} />);
      expect(screen.getByText(/Diuréticos:.*Furosemida/)).toBeInTheDocument();
    });

    it('should include insulin in preview when set', () => {
      render(<RenalForm data={mockData} onChange={mockOnChange} />);
      expect(screen.getByText(/Insulina:.*Insulina Regular/)).toBeInTheDocument();
    });

    it('should not show summary bar when all fields are empty', () => {
      const emptyData: RenalData = {
        diuresis: '',
        diuretics: '',
        glycemia: '',
        balance: '',
        dialysis: '',
        insulin: '',
        observations: '',
        corticoidUse: false,
      };
      render(<RenalForm data={emptyData} onChange={mockOnChange} />);
      expect(screen.queryByText(/Resumo:/i)).not.toBeInTheDocument();
    });

    it('should show partial preview with only diuresis', () => {
      const partialData: RenalData = {
        ...mockData,
        diuretics: '',
        glycemia: '',
        balance: '',
        dialysis: '',
        insulin: '',
        observations: '',
      };
      render(<RenalForm data={partialData} onChange={mockOnChange} />);
      expect(screen.getByText(/Diurese:.*1800 ml/)).toBeInTheDocument();
      expect(screen.queryByText(/Diuréticos:/)).not.toBeInTheDocument();
    });
  });

  describe('TRS dialysis - branch coverage', () => {
    it('should show TRS modality in preview when dialysis is set', () => {
      const dataWithTRS: RenalData = {
        ...mockData,
        dialysis: 'CVVHDF - UF 100 ml/h',
      };
      render(<RenalForm data={dataWithTRS} onChange={mockOnChange} />);
      expect(screen.getByText(/TRS:.*CVVHDF/)).toBeInTheDocument();
    });
  });
});
