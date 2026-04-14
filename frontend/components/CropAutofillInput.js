import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://farmersapp-333z.onrender.com/api';

/**
 * CropAutofillInput
 * 
 * A reusable search-as-you-type crop input backed by the MongoDB MasterCrop collection.
 * Shows a live dropdown with up to 5 suggestions. Falls back gracefully to
 * free-text custom crop names if nothing is found.
 *
 * Props:
 *  - placeholder  {string}  Input placeholder text
 *  - accentColor  {string}  Active/selected colour (default: '#00C853')
 *  - onSelect     {fn}      Called with { _id, name } when user picks from list
 *  - onCustom     {fn}      Called with (name:string) when user accepts free-text
 *  - onClear      {fn}      Called when selection is cleared
 */
export default function CropAutofillInput({
    placeholder = 'Type a crop name...',
    accentColor = '#00C853',
    onSelect,
    onCustom,
    onClear,
}) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selected, setSelected] = useState(null); // { _id, name } or null
    const [localDictionary, setLocalDictionary] = useState([]);
    const debounceRef = useRef(null);

    // Load dictionary once when component mounts
    React.useEffect(() => {
        const loadDictionary = async () => {
            try {
                const stored = await AsyncStorage.getItem('@crop_dictionary');
                if (stored) {
                    setLocalDictionary(JSON.parse(stored));
                }
            } catch (e) {
                console.log('Error loading local crop dictionary', e);
            }
        };
        loadDictionary();
    }, []);

    const handleChange = (text) => {
        setQuery(text);
        setSelected(null); // clear previous selection when typing again
        setShowDropdown(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!text.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
            if (onClear) onClear();
            return;
        }

        // Fast Local Search (Instant)
        if (localDictionary && localDictionary.length > 0) {
            const lowerQuery = text.trim().toLowerCase();
            const matches = localDictionary
                .filter(crop => crop.name.toLowerCase().includes(lowerQuery))
                .slice(0, 6);
            setSuggestions(matches);
        } else {
            // Fallback to remote if dictionary hasn't synced yet
            debounceRef.current = setTimeout(async () => {
                setLoading(true);
                try {
                    const res = await fetch(
                        `${API_BASE_URL}/crops/search?q=${encodeURIComponent(text.trim())}`
                    );
                    const json = await res.json();
                    if (json.success) {
                        setSuggestions(json.data.slice(0, 6));
                    }
                } catch (e) {
                    console.log('CropAutofill search error:', e);
                } finally {
                    setLoading(false);
                }
            }, 380);
        }
    };

    const handlePick = (crop) => {
        setSelected(crop);
        setQuery(crop.name);
        setShowDropdown(false);
        setSuggestions([]);
        if (onSelect) onSelect(crop);
    };

    const handleAcceptCustom = () => {
        const name = query.trim();
        if (!name) return;
        setSelected({ _id: null, name });
        setShowDropdown(false);
        setSuggestions([]);
        if (onCustom) onCustom(name);
    };

    const handleClear = () => {
        setQuery('');
        setSelected(null);
        setSuggestions([]);
        setShowDropdown(false);
        if (onClear) onClear();
    };

    const accentBg = accentColor + '18'; // ~10% opacity tint

    return (
        <View style={styles.wrapper}>
            {/* ── Selected Badge ── */}
            {selected ? (
                <View style={[styles.selectedBadge, { backgroundColor: accentBg, borderColor: accentColor }]}>
                    <MaterialCommunityIcons name="leaf" size={18} color={accentColor} />
                    <Text style={[styles.selectedText, { color: accentColor }]}>{selected.name}</Text>
                    <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                        <MaterialCommunityIcons name="close-circle" size={18} color={accentColor} />
                    </TouchableOpacity>
                </View>
            ) : (
                /* ── Search Input ── */
                <View style={[styles.inputRow, showDropdown && styles.inputRowOpen]}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        value={query}
                        onChangeText={handleChange}
                        placeholder={placeholder}
                        placeholderTextColor="#aaa"
                        onFocus={() => { if (query) setShowDropdown(true); }}
                    />
                    {loading && <ActivityIndicator size="small" color={accentColor} style={styles.rightIcon} />}
                    {!loading && query.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={styles.rightIcon}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── Dropdown ── */}
            {showDropdown && !selected && (
                <View style={styles.dropdown}>
                    {suggestions.length > 0 ? (
                        suggestions.map((crop) => (
                            <TouchableOpacity
                                key={crop._id}
                                style={styles.dropItem}
                                onPress={() => handlePick(crop)}
                            >
                                <MaterialCommunityIcons name="leaf" size={16} color={accentColor} style={{ marginRight: 8 }} />
                                <Text style={styles.dropItemText}>{crop.name}</Text>
                            </TouchableOpacity>
                        ))
                    ) : !loading && query.length > 0 ? (
                        /* Not found row */
                        <TouchableOpacity style={styles.dropItem} onPress={handleAcceptCustom}>
                            <MaterialCommunityIcons name="plus-circle-outline" size={16} color="#888" style={{ marginRight: 8 }} />
                            <View>
                                <Text style={styles.dropItemText}>"{query}" — not in database</Text>
                                <Text style={styles.dropItemSub}>Tap to use this name anyway</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 100,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        backgroundColor: '#fafafa',
        paddingHorizontal: 12,
        minHeight: 52,
    },
    inputRowOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderColor: '#00C853',
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#222',
        paddingVertical: 12,
    },
    rightIcon: {
        padding: 4,
    },
    selectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },
    selectedText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    clearBtn: {
        padding: 2,
    },
    dropdown: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#00C853',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    dropItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dropItemText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dropItemSub: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});
