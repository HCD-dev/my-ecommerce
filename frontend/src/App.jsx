import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 0, name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Verileri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, cartRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products'),
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/cart')
        ]);

        setProducts(productsRes.data);
        setCategories([{ id: 0, name: 'All' }, ...categoriesRes.data]);
        setCartItems(cartRes.data);
      } catch (err) {
        console.error("Veri çekilemedi:", err);
      }
    };

    fetchData();
  }, []);

  // Filtrelenmiş ürünler
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch =
      activeCategory === 'All' ||
      product.category_id === (categories.find(c => c.name === activeCategory) || {}).id;
    return matchesSearch && categoryMatch;
  });

  // Sepete ekle
  const addToCart = async (product) => {
    try {
      await axios.post('http://localhost:5000/api/cart', {
        product_id: product.id,
        quantity: 1
      });

      const cartRes = await axios.get('http://localhost:5000/api/cart');
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
    }
  };

  // Sepetten miktarı güncelle
  const updateCartItemQuantity = async (itemId, newQuantity) => {
    if (typeof newQuantity !== 'number') {
      console.warn("Geçersiz miktar:", newQuantity);
      return;
    }

    if (newQuantity < 1) {
      return deleteCartItem(itemId);
    }

    try {
      await axios.put(`http://localhost:5000/api/cart/${itemId}`, { quantity: newQuantity });
      const cartRes = await axios.get('http://localhost:5000/api/cart');
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Güncellenemedi:", err);
    }
  };

  // Sepetten ürünü sil
  const deleteCartItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
      const cartRes = await axios.get('http://localhost:5000/api/cart');
      setCartItems(cartRes.data);
    } catch (err) {
      console.error("Silinemedi:", err);
    }
  };

  // Toplam ürün sayısı
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={styles.container}>
      {/* Başlık */}
      <h1 style={styles.title}>E-Ticaret Sitesi</h1>

      {/* Arama kutusu */}
      <input
        type="text"
        placeholder="Ürün ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      {/* Kategoriler */}
      <div style={styles.categoriesContainer}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            style={{
              ...styles.categoryButton,
              backgroundColor: activeCategory === category.name ? '#FF9900' : '#fff',
              color: activeCategory === category.name ? '#fff' : '#333'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Ürünler */}
      <div style={styles.productsGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} style={styles.productCard}>
              <img src={product.image_url} alt={product.name} style={styles.productImage} />
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</p>
              <button
                onClick={() => addToCart(product)}
                style={styles.addToCartButton}
              >
                Sepete Ekle
              </button>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Ürün bulunamadı.</p>
        )}
      </div>

      {/* Sabit sepet ikonu */}
      <div style={styles.cartIcon} onClick={() => setIsCartOpen(!isCartOpen)}>
        🛒
        {totalItems > 0 && <span style={styles.cartCount}>{totalItems}</span>}
      </div>

      {/* Sepet paneli */}
      {isCartOpen && (
        <>
          {/* Overlay */}
          <div style={styles.overlay} onClick={() => setIsCartOpen(false)}></div>

          {/* Sepet içeriği */}
          <div style={styles.cartPanel}>
            <h2 style={styles.cartTitle}>Sepetiniz</h2>
            {cartItems.length === 0 ? (
              <p>Sepetiniz boş.</p>
            ) : (
              <ul style={styles.cartList}>
                {cartItems.map(item => (
                  <li key={item.cart_item_id} style={styles.cartItem}>
                    <div style={styles.cartItemTop}>
                      <img src={item.image_url} alt={item.name} style={styles.cartItemImage} />
                      <div style={styles.cartItemInfo}>
                        <strong>{item.name}</strong>
                        <p>${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div style={styles.cartControls}>
                      <button
                        onClick={() => updateCartItemQuantity(item.cart_item_id, item.quantity - 1)}
                        style={styles.cartButton}
                      >
                        -
                      </button>
                      <span style={styles.cartQuantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.cart_item_id, item.quantity + 1)}
                        style={styles.cartButton}
                      >
                        +
                      </button>
                      <button
                        onClick={() => deleteCartItem(item.cart_item_id)}
                        style={styles.deleteButton}
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button style={styles.checkoutButton}>Ödeme Yap</button>
          </div>
        </>
      )}
    </div>
  );
}

// Stil objesi (CSS yerine inline styles)
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  searchInput: {
    width: '100%',
    maxWidth: '600px',
    padding: '0.75rem',
    marginBottom: '1.5rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem'
  },
  categoriesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  },
  categoryButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  productCard: {
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center'
  },
  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  productName: {
    fontSize: '1.1rem',
    margin: '0.5rem 0 0.25rem'
  },
  productPrice: {
    color: '#FF9900',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  addToCartButton: {
    backgroundColor: '#FF9900',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  cartIcon: {
    position: 'fixed',
    top: '2rem',
    right: '2rem',
    backgroundColor: '#FF9900',
    color: 'white',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    zIndex: 1000
  },
  cartCount: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1010,
    display: 'none'
  },
  cartPanel: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100%',
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
    zIndex: 1020,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    boxSizing: 'border-box'
  },
  cartTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem'
  },
  cartList: {
    listStyle: 'none',
    paddingLeft: 0,
    marginBottom: '1rem'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
    marginBottom: '0.5rem'
  },
  cartItemTop: {
    display: 'flex',
    gap: '0.5rem'
  },
  cartItemImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  cartItemInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  cartControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  cartButton: {
    backgroundColor: '#ddd',
    border: 'none',
    borderRadius: '4px',
    padding: '0.3rem 0.6rem',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.3rem 0.6rem',
    cursor: 'pointer',
    marginLeft: '1rem'
  },
  cartQuantity: {
    minWidth: '20px',
    textAlign: 'center'
  },
  checkoutButton: {
    backgroundColor: '#FF9900',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  }
};