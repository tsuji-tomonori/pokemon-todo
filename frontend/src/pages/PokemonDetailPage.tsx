import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import Button from '@/components/common/Button';

const PokemonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Pokemon
      </Button>

      <div className="card-neo">
        <h1 className="text-2xl font-bold mb-4">Pokemon Details</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pokemon ID: {id}
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-4">
          Move management will be implemented in Day 3
        </p>
      </div>
    </div>
  );
};

export default PokemonDetailPage;