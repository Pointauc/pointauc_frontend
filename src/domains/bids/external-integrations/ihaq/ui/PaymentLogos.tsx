const PaymentLogos = () => {
  return (
    <span className='inline-flex shrink-0 items-center gap-1' role='img' aria-label='Visa, Mir and Mastercard'>
      <span className='rounded-sm bg-white px-1 text-[8px] leading-[14px] font-black text-[#1a1f71] italic'>VISA</span>
      <span className='rounded-sm bg-white px-1 text-[8px] leading-[14px] font-black text-[#00877a]'>MIR</span>
      <span className='inline-flex items-center rounded-sm bg-white px-1 text-[8px] leading-[14px] font-bold text-[#111]'>
        <span className='mr-0.5 inline-flex'>
          <span className='h-2 w-2 rounded-full bg-[#eb001b]' />
          <span className='-ml-1 h-2 w-2 rounded-full bg-[#f79e1b]/90' />
        </span>
        mc
      </span>
    </span>
  );
};

export default PaymentLogos;
