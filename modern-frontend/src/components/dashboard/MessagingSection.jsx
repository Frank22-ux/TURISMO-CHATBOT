import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreHorizontal, Info, User, Check, CheckCheck, MessageSquare, Trash2, Edit, Archive, UserCircle, X, Phone, Globe } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const MessagingSection = ({ initialHostId, initialHostName }) => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: 'message', targetId: null, isLoading: false });
  const scrollRef = useRef();

  const fetchConversations = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      const validData = (Array.isArray(data) ? data : []).filter(c => c && c.id_receptor);
      
      if (initialHostId) {
        const existingConv = validData.find(c => String(c.id_receptor) === String(initialHostId));
        if (existingConv) {
          if (!activeChat) setActiveChat(existingConv);
        } else if (initialHostName) {
          const virtualConv = {
            id_receptor: initialHostId,
            nombre_otro: initialHostName,
            ultimo_mensaje: 'Escribe tu primer mensaje...',
            ultimo_tiempo: 'Ahora'
          };
          validData.unshift(virtualConv);
          if (!activeChat) setActiveChat(virtualConv);
        }
      }

      setConversations(validData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChat || !activeChat.id_receptor) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/messages/${activeChat.id_receptor}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [initialHostId, initialHostName]);

  useEffect(() => {
    if (activeChat && activeChat.id_receptor) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const token = sessionStorage.getItem('token');
      // Backend expects POST /api/messages
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          id_receptor: activeChat.id_receptor,
          contenido: newMessage
        })
      });
      if (response.ok) {
        const msg = await response.json();
        const sentMsg = { ...msg, es_mio: true }; // Ensure it's marked as mine for the UI
        setMessages([...messages, sentMsg]);
        setNewMessage('');
        
        // Refresh conversations to update the last message and ensure names are synced
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = (id) => {
    setConfirmState({ isOpen: true, type: 'message', targetId: id, isLoading: false });
  };

  const executeDelete = async () => {
    const { type, targetId } = confirmState;
    setConfirmState(prev => ({ ...prev, isLoading: true }));
    try {
      const token = sessionStorage.getItem('token');
      if (type === 'message') {
        const response = await fetch(`http://localhost:3000/api/messages/${targetId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setMessages(prev => prev.filter(m => m.id_mensaje !== targetId));
        }
      } else if (type === 'chat') {
        await fetch(`http://localhost:3000/api/messages/conversations/${activeChat.id_receptor}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setShowChatMenu(false);
        setActiveChat(null);
        fetchConversations();
      }
      setConfirmState({ isOpen: false, type: 'message', targetId: null, isLoading: false });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setConfirmState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/messages/${editingMsgId}/content`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ contenido: editContent })
      });
      if (response.ok) {
        setMessages(prev => prev.map(m => 
          m.id_mensaje === editingMsgId ? { ...m, contenido: editContent, editado: true } : m
        ));
        setEditingMsgId(null);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleArchiveChat = async () => {
    if (!activeChat) return;
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`http://localhost:3000/api/messages/conversations/${activeChat.id_receptor}/archive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ archive: true })
      });
      setShowChatMenu(false);
      setActiveChat(null);
      fetchConversations();
    } catch (error) {
      console.error('Error archiving chat:', error);
    }
  };

  const handleDeleteChat = () => {
    if (!activeChat) return;
    setConfirmState({ isOpen: true, type: 'chat', targetId: activeChat.id_receptor, isLoading: false });
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Iniciando mensajería...</div>;

  return (
    <div className="h-[calc(100vh-180px)] bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex animate-fade-in">
      {/* Sidebar: Conv List */}
      <div className="w-1/3 border-r border-slate-50 flex flex-col">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-display font-black text-slate-800 mb-6">Mensajes</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar chats..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {!conversations || conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-300">
              <p className="text-sm font-bold">No tienes conversaciones activas</p>
            </div>
          ) : (
            conversations.map((conv, idx) => (
              <button
                key={`${conv.id_receptor || idx}-${idx}`}
                onClick={() => setActiveChat(conv)}
                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all ${
                  activeChat?.id_receptor === conv.id_receptor ? 'bg-primary/5 border border-primary/10 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-sm">
                  {((conv.nombre_otro || 'U')[0] || 'U').toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-slate-800 text-sm">{conv.nombre_otro || 'Usuario'}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{conv.ultimo_tiempo}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{conv.ultimo_mensaje}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col relative">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black">
                  {(activeChat.nombre_otro || 'U')[0]}
                </div>
                <div>
                  <p className="font-black text-slate-800 leading-tight">{activeChat.nombre_otro || 'Usuario'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">En línea</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 relative">
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-2 rounded-xl hover:bg-slate-100 transition-all ${showInfo ? 'text-primary' : 'text-slate-400'}`}
                >
                  <Info className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {showChatMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-50 py-2 z-50">
                      <button 
                        onClick={handleArchiveChat}
                        className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" /> Archivar chat
                      </button>
                      <button 
                        onClick={handleDeleteChat}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Borrar chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area Container */}
            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div 
                ref={scrollRef} 
                className={`flex-1 overflow-auto p-10 space-y-6 bg-slate-50/30 transition-all ${showInfo ? 'mr-0 lg:mr-4' : ''}`}
                onClick={() => {
                  setShowChatMenu(false);
                  setEditingMsgId(null);
                }}
              >
                {Array.isArray(messages) && messages.map((msg, i) => {
                  const isMe = msg.es_mio;
                  const isEditing = editingMsgId === msg.id_mensaje;
                  
                  return (
                    <div key={msg.id_mensaje || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up group relative`}>
                      <div className={`max-w-[70%] relative ${isMe ? 'items-end' : 'items-start'}`}>
                        {isMe && !isEditing && (
                          <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                            <button 
                              onClick={() => {
                                setEditingMsgId(msg.id_mensaje);
                                setEditContent(msg.contenido);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id_mensaje)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        
                        <div className={`p-5 rounded-[24px] ${
                          isMe 
                          ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-50 shadow-sm'
                        }`}>
                          {isEditing ? (
                            <form onSubmit={handleEditMessage} className="space-y-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-white/20 text-white rounded-xl p-2 text-sm border-none outline-none focus:ring-2 focus:ring-white/30"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingMsgId(null)} className="text-[10px] font-bold">Cancelar</button>
                                <button type="submit" className="text-[10px] font-bold bg-white text-primary px-2 py-1 rounded-md">Guardar</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed">{msg.contenido}</p>
                              {msg.editado && <span className="text-[8px] italic opacity-60 block mt-1">Editado</span>}
                            </>
                          )}
                          <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end text-white/60' : 'justify-start text-slate-400'} text-[10px] font-bold`}>
                            {msg.fecha_envio ? new Date(msg.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Sidebar */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="w-80 border-l border-slate-50 bg-white p-8 flex flex-col items-center text-center overflow-auto"
                  >
                    <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 mb-6">
                      {(activeChat.nombre_otro || 'U')[0]}
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-1">{activeChat.nombre_otro || 'Usuario'}</h4>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider mb-8">
                      {activeChat.rol || 'Contacto'}
                    </span>
                    
                    <div className="w-full space-y-4">
                      <div className="p-4 rounded-3xl bg-slate-50 text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Estado</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> En línea ahora
                        </p>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Contacto</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" /> {activeChat.telefono || 'No disponible'}
                        </p>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Idiomas</p>
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-primary" /> {activeChat.idiomas || 'No especificado'}
                        </p>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 text-left">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Información</p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Este usuario es un {activeChat.rol?.toLowerCase()} verificado en la plataforma.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-8 border-t border-slate-50 bg-white">
              <div className="bg-slate-100 p-2 rounded-[28px] flex items-center gap-2 border border-slate-100 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all">
                <button type="button" className="p-3 text-slate-400 hover:text-primary transition-all"><Paperclip className="w-5 h-5" /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje aquí..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm p-2 font-medium"
                />
                <button 
                  type="submit"
                  className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary group">
              <MessageSquare className="w-10 h-10 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-black text-slate-800">Tus mensajes</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                Selecciona una conversación para empezar a chatear con los anfitriones.
              </p>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, type: 'message', targetId: null, isLoading: false })}
        onConfirm={executeDelete}
        isLoading={confirmState.isLoading}
        title={confirmState.type === 'message' ? '¿Eliminar Mensaje?' : '¿Eliminar Conversación?'}
        message={
          confirmState.type === 'message' 
            ? 'Este mensaje se borrará permanentemente para ti.' 
            : 'Se eliminarán todos los mensajes de esta conversación. Esta acción no se puede deshacer.'
        }
      />
    </div>
  );
};

export default MessagingSection;
