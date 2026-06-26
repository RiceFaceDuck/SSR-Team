import { useState, useMemo, useEffect } from 'react';

export const useMarketFilters = (players, mySquad, marketFilterPos, watchlist = []) => {
  const [activeTab, setActiveTab] = useState(marketFilterPos || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-desc'); // price-desc, price-asc, points-desc
  const [selectedClub, setSelectedClub] = useState('ALL');

  // Sync activeTab when marketFilterPos changes from outside (e.g., PitchScreen)
  useEffect(() => {
    if (marketFilterPos && marketFilterPos !== activeTab) {
      setActiveTab(marketFilterPos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketFilterPos]);

  // Extract unique clubs for the filter dropdown
  const availableClubs = useMemo(() => {
    const clubs = new Set();
    players.forEach((p) => {
      if (p.team) clubs.add(p.team);
    });
    return Array.from(clubs).sort();
  }, [players]);

  const displayPlayers = useMemo(() => {
    let filtered = [...players];

    if (activeTab === 'MY_TEAM') {
      filtered = filtered.filter((p) =>
        mySquad.some((sq) => String(sq.playerId) === String(p.sku))
      );
    } else if (activeTab === 'WATCHLIST') {
      filtered = filtered.filter((p) => watchlist.includes(String(p.sku)));
    } else if (activeTab !== 'ALL') {
      filtered = filtered.filter((p) => p.position?.toUpperCase() === activeTab);
    }

    if (selectedClub !== 'ALL') {
      filtered = filtered.filter((p) => p.team === selectedClub);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.fullName?.toLowerCase().includes(q) ||
          p.team?.toLowerCase().includes(q)
      );
    }

    const ownedPlayerIds = new Set(mySquad.map((sq) => String(sq.playerId)));

    filtered.sort((a, b) => {
      const isOwnedA = ownedPlayerIds.has(String(a.sku));
      const isOwnedB = ownedPlayerIds.has(String(b.sku));

      if (isOwnedA && !isOwnedB) return 1;
      if (!isOwnedA && isOwnedB) return -1;

      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      const pointsA = parseInt(a.totalPoints) || 0;
      const pointsB = parseInt(b.totalPoints) || 0;

      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'points-desc') return pointsB - pointsA;
      return 0;
    });

    return filtered;
  }, [players, activeTab, searchQuery, sortBy, selectedClub, mySquad, watchlist]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedClub,
    setSelectedClub,
    availableClubs,
    displayPlayers,
  };
};
