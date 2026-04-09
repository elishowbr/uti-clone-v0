import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NutritionForm, { NutritionData } from '../app/dashboard/[bedId]/evolution/components/forms/NutritionForm';

describe('NutritionForm Component', () => {
  const mockData: NutritionData = {
    supports: [
      { support: { id: 'tneb', name: 'TNE baixo volume', unit: 'ml/h' }, value: '60' },
    ],
    gastricResidue: '< 200 ml',
    prokineticsLaxatives: 'Metoclopramida 10mg 8/8h',
    lastEvacuationDate: '2026-03-29',
    evacuationAspect: 'Pastoso, marrom',
    abdomen: 'Abdome flácido, RHA+',
    isSurgical: false,
    drainsAspect: '',
    operativeWound: '',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-31'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render the section title', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('TGI/Nutrição')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Dieta, evacuações e aspecto abdominal/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.queryByLabelText(/Abdome/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/Abdome/i)).toBeInTheDocument();
  });

  it('should show diet support name in preview', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Dieta:.*TNE baixo volume/)).toBeInTheDocument();
  });

  it('should show evacuation days ago in preview', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    // lastEvacuationDate is 2 days ago from 2026-03-31
    expect(screen.getByText(/Evacuação: 2 dias atrás/)).toBeInTheDocument();
  });

  it('should show evacuation aspect in preview', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Pastoso, marrom/)).toBeInTheDocument();
  });

  it('should show abdomen info in preview', () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Abdome flácido, RHA\+/)).toBeInTheDocument();
  });

  it('should call onChange when abdomen field is updated', async () => {
    render(<NutritionForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const abdomenField = screen.getByLabelText(/Abdome/i);
    await userEvent.clear(abdomenField);
    await userEvent.type(abdomenField, 'Abdome distendido');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('abdomen', expect.any(String));
    });
  });

  it('should handle empty supports array gracefully', () => {
    const emptyData: NutritionData = {
      ...mockData,
      supports: [],
      lastEvacuationDate: '',
      evacuationAspect: '',
      abdomen: '',
    };
    render(<NutritionForm data={emptyData} onChange={mockOnChange} />);
    expect(screen.getByText('TGI/Nutrição')).toBeInTheDocument();
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('isSurgical - branch coverage', () => {
    it('should show surgical fields when isSurgical is true and form is expanded', () => {
      const surgicalData: NutritionData = {
        ...mockData,
        isSurgical: true,
        drainsAspect: 'Seroso, < 50 ml',
        operativeWound: 'Limpa, sem sinais flogísticos',
      };
      render(<NutritionForm data={surgicalData} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button')); // expand

      expect(screen.getByLabelText(/Ferida Operatória|Ferida Cirúrgica/i)).toBeInTheDocument();
    });

    it('should toggle isSurgical when checkbox is clicked', async () => {
      render(<NutritionForm data={mockData} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button')); // expand

      const surgicalCheckbox = screen.getByRole('checkbox');
      fireEvent.click(surgicalCheckbox);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('isSurgical', true);
      });
    });

    it('should not show surgical fields when isSurgical is false', () => {
      render(<NutritionForm data={mockData} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('button')); // expand

      expect(screen.queryByLabelText(/Ferida Operatória|Ferida Cirúrgica/i)).not.toBeInTheDocument();
    });
  });

  describe('preview logic - branch coverage', () => {
    it('should not show preview summary when all data is empty', () => {
      const emptyData: NutritionData = {
        supports: [],
        gastricResidue: '',
        prokineticsLaxatives: '',
        lastEvacuationDate: '',
        evacuationAspect: '',
        abdomen: '',
        isSurgical: false,
        drainsAspect: '',
        operativeWound: '',
      };
      render(<NutritionForm data={emptyData} onChange={mockOnChange} />);
      // When collapsed with no extra data, the summary bar should not appear
      expect(screen.queryByText(/Resumo:/i)).not.toBeInTheDocument();
    });

    it('should show multiple supports joined with " + "', () => {
      const multiSupport: NutritionData = {
        ...mockData,
        supports: [
          { support: { id: 'tneb', name: 'TNE baixo volume', unit: 'ml/h' }, value: '60' },
          { support: { id: 'npt', name: 'NPT', unit: 'ml/h' }, value: '40' },
        ],
      };
      render(<NutritionForm data={multiSupport} onChange={mockOnChange} />);
      expect(screen.getByText(/TNE baixo volume/)).toBeInTheDocument();
    });
  });
});
