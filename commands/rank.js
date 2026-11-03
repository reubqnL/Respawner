import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../database.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your current level and XP'),

    async execute(interaction) {
        // required role ID for member
        const targetRoleId = '1529103788231626812';

        if (!interaction.member.roles.cache.has(targetRoleId)) {
            return interaction.reply({
                content: '❌ You do not have the required role to use this command.',
                ephemeral: true
            });
        }

        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const stmt = db.prepare('SELECT xp, level FROM user_levels WHERE guild_id = ? AND user_id = ?');
        const row = stmt.get(guildId, userId);

        // fallback values
        const level = row ? row.level : 0;
        const currentLevelXp = row ? row.xp : 0;

        const totalLifetimeXp = (level * 100) + currentLevelXp;

        const xpNeeded = 100;

        // embed to display the rank
        const rankEmbed = new EmbedBuilder()
            .setColor(0x9D00FF) // Neon Violet
            .setTitle(`${interaction.user.username}'s Rank`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'Total XP Overall', value: `${totalLifetimeXp} XP`, inline: true },
                { name: 'Progress', value: `${currentLevelXp} / ${xpNeeded} XP to next level` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [rankEmbed] });
    },
};