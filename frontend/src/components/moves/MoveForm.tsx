import { useState } from 'react';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

interface MoveFormProps {
  onSubmit: (name: string, description: string, power: number) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    description: string;
    power: number;
  };
}

const MoveForm = ({ onSubmit, onCancel, initialData }: MoveFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [power, setPower] = useState(initialData?.power || 50);
  const [errors, setErrors] = useState<{ name?: string; description?: string; power?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; description?: string; power?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Move name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (power < 1 || power > 100) {
      newErrors.power = 'Power must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), description.trim(), power);
    }
  };

  const powerColor = power >= 80 ? 'red' : power >= 50 ? 'yellow' : 'green';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Move Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-neo"
          placeholder="Enter move name..."
          autoFocus
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Description input */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-neo min-h-[80px] resize-y"
          placeholder="Describe the task..."
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Power slider */}
      <div>
        <label htmlFor="power" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Power Level: {power}/100
        </label>
        <div className="space-y-2">
          <input
            id="power"
            type="range"
            min="1"
            max="100"
            value={power}
            onChange={(e) => setPower(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
          />
          <ProgressBar 
            value={power} 
            max={100} 
            color={powerColor}
            size="sm"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Easy Task</span>
            <span>Hard Task</span>
          </div>
        </div>
        {errors.power && (
          <p className="mt-1 text-sm text-red-500">{errors.power}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {initialData ? 'Update' : 'Create'} Move
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MoveForm;