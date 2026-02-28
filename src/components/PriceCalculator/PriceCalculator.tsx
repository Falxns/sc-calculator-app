import useLocalStorage from '../../hooks/useLocalStorage';
import type { CalculatorState } from '../../types';
import slastena from '../../assets/slastena.svg';

const PriceCalculator = () => {
    const [calculatorState, setCalculatorState] = useLocalStorage<CalculatorState>('calculatorState', {
        price: 0,
        quantity: 0,
        total: 0,
    });

    return (
        <div className='flex justify-center items-center gap-2 bg-gray-700 text-gray-200 p-2 rounded-2xl'>
            <img src={slastena} alt='Slastena' className='w-16 h-16' />
            <input className='text-base text-black text-center p-2 rounded-md w-24 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500' type="number" value={calculatorState.price === 0 ? '' : calculatorState.price} placeholder='Price' onChange={(e) => {
                const nextPrice = e.target.value === '' ? 0 : Number(e.target.value);
                setCalculatorState({ ...calculatorState, price: nextPrice, total: nextPrice * calculatorState.quantity });
            }} />
            <input className='text-base text-black text-center p-2 rounded-md w-24 border-2 border-gray-500 bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500' type="number" value={calculatorState.quantity === 0 ? '' : calculatorState.quantity} placeholder='Quantity' onChange={(e) => {
                const nextQuantity = e.target.value === '' ? 0 : Number(e.target.value);
                setCalculatorState({ ...calculatorState, quantity: nextQuantity, total: calculatorState.price * nextQuantity });
            }} />
            <p className='text-base font-bold'>Total: {calculatorState.total}</p>
        </div>
    );
};

export default PriceCalculator;