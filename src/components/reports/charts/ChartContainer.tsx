import React, { useRef, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { optimizeChartForExport } from '../../../utils/chartUtils';

interface ChartContainerProps {
  id: string;
  title: string;
  description: string;
  onCopy: () => void;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  id,
  title,
  description,
  onCopy,
  children,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const cleanup = optimizeChartForExport(chartRef.current);
      return cleanup;
    }
  }, []);

  return (
    <div id={id} ref={chartRef} className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
          onClick={onCopy}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
          title="Copiar gráfico"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;