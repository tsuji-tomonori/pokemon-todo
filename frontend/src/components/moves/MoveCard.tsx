import { Move } from '../../types/move';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { CheckCircle, Circle, Trash, PencilSimple, Lightning } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface MoveCardProps {
  move: Move;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MoveCard = ({ move, onComplete, onEdit, onDelete }: MoveCardProps) => {
  const powerColor = move.power >= 80 ? 'red' : move.power >= 50 ? 'yellow' : 'green';

  return (
    <Card className={clsx(
      'transition-all duration-200',
      move.is_completed ? 'opacity-60 bg-green-50 dark:bg-green-900/20' : ''
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onComplete}
            className={clsx(
              'transition-colors',
              move.is_completed 
                ? 'text-green-500' 
                : 'text-gray-400 hover:text-green-500'
            )}
          >
            {move.is_completed ? (
              <CheckCircle size={24} weight="fill" />
            ) : (
              <Circle size={24} />
            )}
          </button>
          <h3 className={clsx(
            'font-semibold text-lg',
            move.is_completed 
              ? 'line-through text-gray-500 dark:text-gray-400' 
              : 'text-gray-800 dark:text-white'
          )}>
            {move.name}
          </h3>
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <PencilSimple size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash size={18} className="text-red-500" />
            </button>
          )}
        </div>
      </div>

      {move.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          {move.description}
        </p>
      )}

      {/* Power indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightning size={16} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Power
            </span>
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {move.power}/100
          </span>
        </div>
        <ProgressBar 
          value={move.power} 
          max={100} 
          color={powerColor}
          size="sm"
        />
      </div>

      {move.is_completed && move.completed_at && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Completed: {new Date(move.completed_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </Card>
  );
};

export default MoveCard;