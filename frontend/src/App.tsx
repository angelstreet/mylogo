import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Generator from '@/pages/Generator';

export default function App() {
  return (
    <Layout onLogout={() => {}}>
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
