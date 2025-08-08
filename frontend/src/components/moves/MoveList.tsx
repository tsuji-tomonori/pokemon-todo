import { Move } from '../../types/move';
import MoveCard from './MoveCard';
import { motion } from 'framer-motion';

interface MoveListProps {
  moves: Move[];
  onCompleteMove?: (move: Move) => void;
  onEditMove?: (move: Move) => void;
  onDeleteMove?: (move: Move) => void;
  showCompleted?: boolean;
}

const MoveList = ({ 
  moves, 
  onCompleteMove, 
  onEditMove, 
  onDeleteMove,
  showCompleted = true
}: MoveListProps) => {
  const filteredMoves = showCompleted 
    ? moves 
    : moves.filter(move => !move.is_completed);

  if (filteredMoves.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">⚡</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
          No moves yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {showCompleted 
            ? "Add some moves to get started with tasks!"
            : "All moves completed! Great job!"
          }
        </p>
      </div>
    );
  }

  // Group moves by completion status
  const completedMoves = filteredMoves.filter(move => move.is_completed);
  const pendingMoves = filteredMoves.filter(move => !move.is_completed);

  return (
    <div className="space-y-6">
      {/* Pending moves */}
      {pendingMoves.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Pending Tasks ({pendingMoves.length})
          </h3>
          <div className="grid gap-3">
            {pendingMoves.map((move, index) => (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MoveCard
                  move={move}
                  onComplete={() => onCompleteMove?.(move)}
                  onEdit={() => onEditMove?.(move)}
                  onDelete={() => onDeleteMove?.(move)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed moves */}
      {showCompleted && completedMoves.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Completed Tasks ({completedMoves.length})
          </h3>
          <div className="grid gap-3">
            {completedMoves.map((move, index) => (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (pendingMoves.length + index) * 0.1 }}
              >
                <MoveCard
                  move={move}
                  onEdit={() => onEditMove?.(move)}
                  onDelete={() => onDeleteMove?.(move)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveList;