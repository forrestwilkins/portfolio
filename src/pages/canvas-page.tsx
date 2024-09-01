import Canvas from '@/components/shared/canvas';

const CanvasPage = () => {
  const handleCanvasMount = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.fillRect(
      canvas.width * 0.25,
      canvas.height * 0.25,
      canvas.width * 0.5,
      canvas.height * 0.5,
    );
    context.fillStyle = 'rgb(200, 200, 200)';
  };

  return (
    <div className="flex justify-center">
      <Canvas
        width={500}
        height={500}
        className="border-2"
        onMount={handleCanvasMount}
      />
    </div>
  );
};

export default CanvasPage;
