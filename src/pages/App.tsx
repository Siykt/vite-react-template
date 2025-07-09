import ViteIcon from '@/assets/SVG/vite.svg';

const App = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <ViteIcon className="w-20 h-20" />
      <h1 className="text-2xl font-bold">Vite React Template</h1>
      <div className="flex flex-col gap-2 justify-center items-center">
        <p className="text-sm text-gray-500">This is a template for a Vite React project.</p>
        <div className="flex gap-2">
          <p className="text-sm text-gray-500">
            Author:
            <a href="https://github.com/Siykt" target="_blank" rel="noreferrer" className="text-blue-500 ml-1">
              Siykt
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Email:
            <a href="mailto:cnsiykt@163.com" target="_blank" rel="noreferrer" className="text-blue-500 ml-1">
              cnsiykt@163.com
            </a>
          </p>
          <p className="text-sm text-gray-500">Version: {import.meta.env.VITE_APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
