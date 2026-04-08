import Sidebar from './Sidebar';

const AppLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Sidebar />

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          {/* Page header */}
          {title && (
            <header className="mb-8 pt-10 lg:pt-0 animate-fade-in">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
              )}
            </header>
          )}

          {/* Page content */}
          <div className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
