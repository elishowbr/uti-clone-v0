import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProphylaxisForm, { ProphylaxisData } from '../app/dashboard/[bedId]/evolution/components/forms/ProphylaxisForm';

describe('ProphylaxisForm Component', () => {
  const mockData: ProphylaxisData = {
    anticoagulation: 'Enoxaparina 40 mg/dia',
    ibp: 'Omeprazol 40 mg/dia',
    others: 'Decúbito elevado 30°',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the section title', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Profilaxias')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/TEV, úlcera de estresse e cuidados gerais/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.queryByLabelText(/Anticoagulação/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/Anticoagulação/i)).toBeInTheDocument();
  });

  it('should collapse again when button is clicked twice', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn); // expand
    fireEvent.click(btn); // collapse
    expect(screen.queryByLabelText(/Anticoagulação/i)).not.toBeInTheDocument();
  });

  it('should show anticoagulation in collapsed preview', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Enoxaparina 40 mg\/dia/)).toBeInTheDocument();
  });

  it('should show IBP in collapsed preview', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Omeprazol 40 mg\/dia/)).toBeInTheDocument();
  });

  it('should show "others" in collapsed preview', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Decúbito elevado 30°/)).toBeInTheDocument();
  });

  it('should show expanded preview box when form is open', () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand
    expect(screen.getByText(/Prévia das Profilaxias/i)).toBeInTheDocument();
  });

  it('should call onChange when anticoagulation field is updated', async () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const anticoagField = screen.getByLabelText(/Anticoagulação/i);
    await userEvent.clear(anticoagField);
    await userEvent.type(anticoagField, 'Heparina 5000 UI 12/12h');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('anticoagulation', expect.any(String));
    });
  });

  it('should call onChange when IBP field is updated', async () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));

    const ibpField = screen.getByLabelText(/IBP/i);
    await userEvent.clear(ibpField);
    await userEvent.type(ibpField, 'Pantoprazol 40 mg/dia');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('ibp', expect.any(String));
    });
  });

  it('should call onChange when others field is updated', async () => {
    render(<ProphylaxisForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));

    const othersField = screen.getByLabelText(/Outros/i);
    await userEvent.clear(othersField);
    await userEvent.type(othersField, 'Fisioterapia motora');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('others', expect.any(String));
    });
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('generatePreview - branch coverage', () => {
    it('should not show preview summary when all fields are empty', () => {
      const emptyData: ProphylaxisData = {
        anticoagulation: '',
        ibp: '',
        others: '',
      };
      render(<ProphylaxisForm data={emptyData} onChange={mockOnChange} />);
      expect(screen.queryByText(/Resumo:/i)).not.toBeInTheDocument();
    });

    it('should show partial preview with only anticoagulation set', () => {
      const partialData: ProphylaxisData = {
        anticoagulation: 'Botas de compressão pneumática',
        ibp: '',
        others: '',
      };
      render(<ProphylaxisForm data={partialData} onChange={mockOnChange} />);
      expect(screen.getByText(/Botas de compressão pneumática/)).toBeInTheDocument();
      expect(screen.queryByText(/Profilaxia Úlcera:/)).not.toBeInTheDocument();
    });

    it('should include "Outros" in preview when present', () => {
      const dataWithOthers: ProphylaxisData = {
        anticoagulation: '',
        ibp: '',
        others: 'Mobilização precoce',
      };
      render(<ProphylaxisForm data={dataWithOthers} onChange={mockOnChange} />);
      expect(screen.getByText(/Outros:.*Mobilização precoce/)).toBeInTheDocument();
    });
  });
});
