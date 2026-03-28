import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const MyReviewsSection = () => {
  const [reviewsData, setReviewsData] = useState({ reviews: [], promedio: "0.0", total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/reviews/received', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setReviewsData(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando tus reseñas...</div>;

  return (
    <div className="space-y-10 animate-fade-in relative max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">Mis Reseñas</h2>
          <p className="text-slate-500 mt-1">Descubre lo que la comunidad opina sobre tus experiencias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Puntuación Media Card */}
        <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center h-fit sticky top-8">
          <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8" fill="currentColor" />
          </div>
          <h3 className="text-6xl font-black font-display text-slate-800 mb-2">{reviewsData.promedio}</h3>
          <div className="flex gap-1 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${star <= Math.round(Number(reviewsData.promedio)) ? 'text-orange-400' : 'text-slate-200'}`} 
                fill="currentColor" 
              />
            ))}
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{reviewsData.total} valoraciones</p>
        </div>

        {/* Lista de Reseñas */}
        <div className="md:col-span-2 space-y-6">
          {reviewsData.reviews.length === 0 ? (
            <div className="bg-white p-16 rounded-[2rem] border border-slate-50 text-center flex flex-col items-center">
              <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Aún no tienes reseñas</h3>
              <p className="text-slate-500 text-sm">Pronto recibirás calificaciones de tus viajes o anfitriones.</p>
            </div>
          ) : (
            reviewsData.reviews.map((rev, i) => (
              <motion.div 
                key={rev.id_resena}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {rev.autor_avatar ? (
                        <img src={rev.autor_avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        rev.autor_nombre[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{rev.autor_nombre}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(rev.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })} • {rev.rol_autor}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                     {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= rev.puntuacion ? 'text-orange-400' : 'text-slate-200'}`} 
                        fill="currentColor" 
                      />
                    ))}
                  </div>
                </div>
                
                {rev.actividad_titulo && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Experiencia: {rev.actividad_titulo}
                    </span>
                  </div>
                )}

                {rev.comentario && (
                  <p className="text-slate-600 leading-relaxed text-sm">"{rev.comentario}"</p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviewsSection;
