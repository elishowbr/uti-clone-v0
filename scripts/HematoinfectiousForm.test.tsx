import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HematoinfectiousForm, { HematoinfectiousData } from '../app/dashboard/[bedId]/evolution/components/forms/HematoinfectiousForm';

describe('HematoinfectiousForm Component', () => {
  const mockData: HematoinfectiousData = {
    antibiotics: [{ id: '1', name: 'Ceftriaxona', startDate: new Date('2026-03-20') }],
    cultures: [{ id: '1', material: 'Sangue', sensitivity: 'Sensível' }],
    temperature: '38.5',
    biomarkers: 'PCR: 8.5 mg/dL',
    corticoids: 'Dexametasona 10mg',
    observations: 'Monitorar febre',
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

  it('should render form section with title', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText('Hematoinfeccioso')).toBeInTheDocument();
  });

  it('should render subtitle when collapsed', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Antibióticos, culturas e curva térmica/i)).toBeInTheDocument();
  });

  it('should be collapsed by default', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    // Fields inside the expanded panel should not be visible
    expect(screen.queryByLabelText(/Temperaturas/i)).not.toBeInTheDocument();
  });

  it('should expand when header button is clicked', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    expect(screen.getByLabelText(/Temperaturas/i)).toBeInTheDocument();
  });

  it('should collapse again when header button is clicked twice', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton); // expand
    fireEvent.click(toggleButton); // collapse
    expect(screen.queryByLabelText(/Temperaturas/i)).not.toBeInTheDocument();
  });

  it('should calculate antibiotic days correctly (D11 for 11 days ago)', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    // Preview is visible in collapsed state when hasData is true
    expect(screen.getByText(/Ceftriaxona \(D11\)/)).toBeInTheDocument();
  });

  it('should show culture in collapsed preview', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Sangue.*Sensível/)).toBeInTheDocument();
  });

  it('should show temperature in preview', () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    expect(screen.getByText(/Temp: 38\.5/)).toBeInTheDocument();
  });

  it('should call onChange when temperature is changed', async () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const tempTextarea = screen.getByLabelText(/Temperaturas/i);
    await userEvent.clear(tempTextarea);
    await userEvent.type(tempTextarea, '37.0');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('temperature', expect.any(String));
    });
  });

  it('should call onChange when biomarkers is changed', async () => {
    render(<HematoinfectiousForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button')); // expand

    const biomarkersTextarea = screen.getByLabelText(/Biomarcador/i);
    await userEvent.clear(biomarkersTextarea);
    await userEvent.type(biomarkersTextarea, 'Procalcitonina: 5');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('biomarkers', expect.any(String));
    });
  });

  it('should handle empty data gracefully', () => {
    const emptyData: HematoinfectiousData = {
      antibiotics: [],
      cultures: [],
      temperature: '',
      biomarkers: '',
      corticoids: '',
      observations: '',
    };
    render(<HematoinfectiousForm data={emptyData} onChange={mockOnChange} />);
    // Should render without throwing and show the title
    expect(screen.getByText('Hematoinfeccioso')).toBeInTheDocument();
  });

  // ── Branch Coverage ────────────────────────────────────────────────────────
  describe('formatAntibiotics - branch coverage', () => {
    it('should format multiple antibiotics in preview', () => {
      const multiAbx: HematoinfectiousData = {
        ...mockData,
        antibiotics: [
          { id: '1', name: 'Ceftriaxona', startDate: new Date('2026-03-20') },
          { id: '2', name: 'Vancomicina', startDate: new Date('2026-03-25') },
        ],
      };
      render(<HematoinfectiousForm data={multiAbx} onChange={mockOnChange} />);
      expect(screen.getByText(/Ceftriaxona/)).toBeInTheDocument();
      expect(screen.getByText(/Vancomicina/)).toBeInTheDocument();
    });

    it('should format antibiotic with D0 when start date is today', () => {
      const todayAbx: HematoinfectiousData = {
        ...mockData,
        antibiotics: [{ id: '1', name: 'Meropenem', startDate: new Date('2026-03-31') }],
        cultures: [],
      };
      render(<HematoinfectiousForm data={todayAbx} onChange={mockOnChange} />);
      expect(screen.getByText(/Meropenem \(D0\)/)).toBeInTheDocument();
    });
  });

  describe('formatCultures - branch coverage', () => {
    it('should show "Pendente" when culture has no sensitivity', () => {
      const pendingCulture: HematoinfectiousData = {
        ...mockData,
        antibiotics: [],
        cultures: [{ id: '1', material: 'Urina', sensitivity: '' }],
      };
      render(<HematoinfectiousForm data={pendingCulture} onChange={mockOnChange} />);
      expect(screen.getByText(/Urina.*Pendente/)).toBeInTheDocument();
    });

    it('should filter cultures with empty material', () => {
      const noMaterial: HematoinfectiousData = {
        ...mockData,
        antibiotics: [],
        cultures: [{ id: '1', material: '', sensitivity: 'Sensível' }],
      };
      render(<HematoinfectiousForm data={noMaterial} onChange={mockOnChange} />);
      // Preview should not include cultures section without material
      expect(screen.queryByText(/Culturas:/)).not.toBeInTheDocument();
    });
  });
});
